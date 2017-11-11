/**
 * Container component for notifications list with filter
 */
import React, { PropTypes } from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Sticky from 'react-stickynode'
import { setNotificationsFilterBy, markAllNotificationsRead, toggleNotificationRead, viewOlderNotifications } from '../actions'
import FooterV2 from '../../../components/FooterV2/FooterV2'
import NotificationsSection from '../../../components/NotificationsSection/NotificationsSection'
import NotificationsSectionTitle from '../../../components/NotificationsSectionTitle/NotificationsSectionTitle'
import SideFilter from '../../../components/SideFilter/SideFilter'
import NotificationsEmpty from '../../../components/NotificationsEmpty/NotificationsEmpty'
import spinnerWhileLoading from '../../../components/LoadingSpinner'
import { getNotificationsFilters, splitNotificationsBySources, filterReadNotifications } from '../helpers/notifications'
import { requiresAuthentication } from '../../../components/AuthenticatedComponent'
import './NotificationsContainer.scss'

class NotificationsContainer extends React.Component {
  componentDidMount() {
    document.title = 'Notifications - TopCoder'
  }

  render() {
    const { sources, notifications, filterBy, setNotificationsFilterBy,
      markAllNotificationsRead, toggleNotificationRead, viewOlderNotifications } = this.props
    const notReadNotifications = filterReadNotifications(notifications)
    const notificationsBySources = splitNotificationsBySources(sources, notReadNotifications)
    let globalSource = notificationsBySources.length > 0 && notificationsBySources[0].id === 'global' ? notificationsBySources[0] : null
    let projectSources = globalSource ? notificationsBySources.slice(1) : notificationsBySources
    if (filterBy) {
      if (filterBy === 'global') {
        projectSources = []
      } else {
        globalSource = null
        projectSources = _.filter(projectSources, { id: filterBy })
      }
    }

    return (
      <div className="notifications-container">
        <div className="content">
          {globalSource && globalSource.total > 0 &&
            <NotificationsSection
              {...globalSource}
              isGlobal
              onMarkAllClick={() => markAllNotificationsRead()}
              onReadToggleClick={toggleNotificationRead}
              onViewOlderClick={() => viewOlderNotifications(globalSource.id, globalSource.notifications.length)}
            />
          }
          {projectSources.length > 0 && <NotificationsSectionTitle title="Project" isGlobal />}
          {projectSources.filter(source => source.total > 0).map(source =>
            <NotificationsSection
              key={source.id}
              {...source}
              onMarkAllClick={() => markAllNotificationsRead(source.id)}
              onReadToggleClick={toggleNotificationRead}
              onViewOlderClick={() => viewOlderNotifications(source.id, source.notifications.length)}
            />
          )}
          {globalSource || projectSources.length > 0 ?
            <div className="end-of-list">End of list</div> :
            <NotificationsEmpty>
              <p className="notifications-empty-note">
                Maybe you need to check your <Link to="/settings/notifications" className="tc-link">notification settings</Link> to
                get up  to date with the latest activity from your projects?
              </p>
            </NotificationsEmpty>
          }
        </div>
        <aside className="filters">
          <Sticky top={90}>
            <SideFilter
              filterSections={getNotificationsFilters(sources)}
              selectedFilter={filterBy}
              onFilterItemClick={setNotificationsFilterBy}
            >
              <Link to="/settings/notifications" className="tc-btn tc-btn-default">Notification Settings</Link>
            </SideFilter>
            <FooterV2 />
          </Sticky>
        </aside>
      </div>
    )
  }
}

NotificationsContainer.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  notifications: PropTypes.array,
  sources: PropTypes.array,
  filterBy: PropTypes.string
}

const enhance = spinnerWhileLoading(props => !props.isLoading)
const NotificationsContainerWithLoader = enhance(NotificationsContainer)
const NotificationsContainerWithLoaderAndAuth = requiresAuthentication(NotificationsContainerWithLoader)

const mapStateToProps = ({ notifications }) => notifications

const mapDispatchToProps = {
  setNotificationsFilterBy,
  markAllNotificationsRead,
  toggleNotificationRead,
  viewOlderNotifications
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsContainerWithLoaderAndAuth)
